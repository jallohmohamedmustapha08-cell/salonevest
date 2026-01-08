'use server';

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// --- Helper: Fetch Weather Data ---
async function fetchWeatherData(location: string) {
    if (!process.env.OPENWEATHER_API_KEY) return null;
    try {
        // 1. Geocoding
        const geoRes = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},SL&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) return null;

        const { lat, lon } = geoData[0];

        // 2. Current Weather
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherRes.json();
        return weatherData;
    } catch (err) {
        console.error("Weather Fetch Error:", err);
        return null;
    }
}

// --- Helper: Deterministic Scoring ---
function calculateDeterministicScore(project: any, weather: any) {
    let score = 50; // Base Score
    let breakdown = ["Base Score: 50"];

    // 1. Project Completeness
    if (project.description && project.description.length > 100) {
        score += 10;
        breakdown.push("Detailed Description (+10)");
    }
    if (project.image_url) {
        score += 10;
        breakdown.push("Project Image (+10)");
    }
    if (project.location) {
        score += 5;
        breakdown.push("Location Specified (+5)");
    }

    // 2. Verification History
    const reports = project.verification_reports || [];
    const verifiedCount = reports.filter((r: any) => r.status === 'Verified').length;
    const rejectedCount = reports.filter((r: any) => r.status === 'Rejected').length;

    if (verifiedCount > 0) {
        const boost = Math.min(verifiedCount * 10, 30); // Max 30 points
        score += boost;
        breakdown.push(`${verifiedCount} Verified Reports (+${boost})`);
    }
    if (rejectedCount > 0) {
        const penalty = rejectedCount * 20;
        score -= penalty;
        breakdown.push(`${rejectedCount} Rejected Reports (-${penalty})`);
    }

    // 3. Weather Factors (Real Data)
    if (weather) {
        // Rainfall check (last 3h or 1h) - simplistic assumption for "rainy season" verification
        const isRaining = weather.weather?.some((w: any) => w.main === 'Rain' || w.main === 'Drizzle');
        const temp = weather.main?.temp || 25;

        if (isRaining) {
            score += 5;
            breakdown.push("Active Rainfall (Good for crops) (+5)");
        } else {
            breakdown.push("No Active Rain (Neutral)");
        }

        if (temp > 35) {
            score -= 5;
            breakdown.push("Extreme Heat Risk (-5)");
        }
    } else {
        breakdown.push("Weather Data Unavailable (Neutral)");
    }

    // Clamp Score
    score = Math.max(0, Math.min(score, 100));

    return { score, breakdown };
}

export async function analyzeProjectTrustScore(projectId: string | number) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    try {
        // 1. Fetch Project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
        *,
        entrepreneur:profiles!entrepreneur_id(full_name, business_name),
        verification_reports(report_text, status, created_at)
      `)
            .eq('id', projectId)
            .single();

        if (!project) return { error: "Project not found" };

        // 2. Fetch External Data
        const weather = await fetchWeatherData(project.location || "Freetown");

        // 3. Calculate Deterministic Score
        const { score, breakdown } = calculateDeterministicScore(project, weather);

        let analysisResult;

        // 4. AI Narrative Generation (Optional / Enhancement)
        if (process.env.GOOGLE_API_KEY) {
            try {
                const prompt = `
          You are a risk analyst.
          Project: ${project.title}
          Location: ${project.location} (Weather: ${weather ? `${weather.weather[0].description}, ${weather.main.temp}°C` : "Unknown"})
          Calculated Trust Score: ${score}/100
          Score Breakdown: ${breakdown.join(", ")}
          
          Task: Write a JSON summary explaining this score.
          {
            "reasoning": "2 sentences explaining the score based on the breakdown and weather.",
            "risk_factors": ["List 2 potential risks"],
            "positive_signals": ["List 2 positive strength"]
          }
        `;

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
                analysisResult = JSON.parse(jsonString);

            } catch (e) {
                console.warn("AI Generation failed, using fallback text");
            }
        }

        // 5. Fallback Analysis if AI failed
        if (!analysisResult) {
            analysisResult = {
                reasoning: `Trust Score calculated based on ${breakdown.length} data points. Current weather conditions and verification history were key factors.`,
                risk_factors: ["Automated Risk Assessment", "Weather variability"],
                positive_signals: breakdown.slice(0, 3) // Top 3 positive factors
            };
        }

        // 6. Save
        await supabase
            .from('projects')
            .update({
                trust_score: score,
                ai_analysis_result: analysisResult
            })
            .eq('id', projectId);

        revalidatePath(`/projects/${projectId}`);
        return { success: true, score, analysis: analysisResult };

    } catch (error: any) {
        console.error("Trust Score Logic Failed:", error);
        return { error: error.message };
    }
}
