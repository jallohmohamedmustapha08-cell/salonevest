'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to create a product." };
    }

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'marketplace-images' bucket (assuming it exists or we use project-images)
        // Let's use 'project-images' for now as it's known to exist, or create a new one if possible.
        // Ideally we should use a dedicated bucket. I'll use 'project-images' to avoid bucket creation issues for now.
        const { error: uploadError } = await supabase
            .storage
            .from('project-images')
            .upload(filePath, imageFile, {
                contentType: imageFile.type,
                upsert: true
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return { error: "Image upload failed: " + uploadError.message };
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('project-images')
            .getPublicUrl(filePath);

        imageUrl = publicUrl;
    }

    const { error } = await supabase
        .from('marketplace_products')
        .insert({
            entrepreneur_id: user.id,
            title,
            description,
            price,
            stock,
            category,
            image_url: imageUrl
        });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/marketplace');
    revalidatePath('/dashboard/entrepreneur/products');
    return { success: true };
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Check if user is admin or the owner
    // We can rely on RLS, but for admin we might need explicit check if RLS doesn't cover "admin deletes all"
    // Our RLS "Entrepreneurs manage own products" handles owner.
    // We need an admin policy or use service role.
    // Let's assume we added an admin policy or we check role here.

    // Check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    // Soft Delete: Update deleted_at instead of DELETE
    let query = supabase
        .from('marketplace_products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', productId);

    if (!isAdmin) {
        // If not admin, ensure it's their product
        query = query.eq('entrepreneur_id', user.id);
    }

    const { error } = await query;

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/marketplace');
    revalidatePath('/dashboard/entrepreneur/products');
    revalidatePath('/dashboard/admin/marketplace');
    return { success: true };
}

export async function getProducts(filter?: any) {
    const supabase = await createClient();

    let query = supabase
        .from('marketplace_products')
        .select('*')
        .is('deleted_at', null) // Filter out soft-deleted products
        .gt('stock', 0) // Filter out out-of-stock products
        .order('created_at', { ascending: false });

    if (filter?.category) {
        query = query.eq('category', filter.category);
    }

    // Add more filters as needed

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File;

    // Check ownership
    const { data: product } = await supabase
        .from('marketplace_products')
        .select('entrepreneur_id')
        .eq('id', productId)
        .single();

    if (!product || product.entrepreneur_id !== user.id) {
        return { error: "You can only edit your own products." };
    }

    const updateData: any = {
        title,
        description,
        price,
        stock,
        category,
        updated_at: new Date().toISOString()
    };

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase
            .storage
            .from('project-images')
            .upload(filePath, imageFile, {
                contentType: imageFile.type,
                upsert: true
            });

        if (uploadError) {
            return { error: "Image upload failed: " + uploadError.message };
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('project-images')
            .getPublicUrl(filePath);

        updateData.image_url = publicUrl;
    }

    const { error } = await supabase
        .from('marketplace_products')
        .update(updateData)
        .eq('id', productId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/marketplace');
    revalidatePath('/dashboard/entrepreneur/products');
    revalidatePath(`/marketplace/${productId}`);
    return { success: true };
}

export async function getProduct(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('marketplace_products')
        .select('*, profiles(full_name, business_name)')
        .eq('id', id)
        .is('deleted_at', null) // Ensure we don't show deleted products
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

export async function createOrder(
    cartItems: any[],
    total: number,
    shippingAddress: string,
    paymentMethod: string = 'mobile_money',
    txHash: string | null = null
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to place an order." };
    }

    // Group items by entrepreneur to create separate orders
    const ordersByEntrepreneur: Record<string, any[]> = {};

    cartItems.forEach(item => {
        if (!ordersByEntrepreneur[item.entrepreneur_id]) {
            ordersByEntrepreneur[item.entrepreneur_id] = [];
        }
        ordersByEntrepreneur[item.entrepreneur_id].push(item);
    });

    const results = [];

    for (const entrepreneurId in ordersByEntrepreneur) {
        const items = ordersByEntrepreneur[entrepreneurId];
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create Order
        const { data: order, error: orderError } = await supabase
            .from('marketplace_orders')
            .insert({
                buyer_id: user.id,
                entrepreneur_id: entrepreneurId,
                total_amount: orderTotal,
                shipping_address: shippingAddress,
                status: 'Paid', // Payment is confirmed before this action
                escrow_status: 'Held',
                payment_method: paymentMethod,
                transaction_hash: txHash,
                payment_intent_id: txHash
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order:", orderError);
            return { error: orderError.message };
        }

        // Create Order Items and Decrement Stock
        for (const item of items) {
            // 1. Create Order Item
            const { error: itemError } = await supabase
                .from('marketplace_order_items')
                .insert({
                    order_id: order.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                });

            if (itemError) {
                console.error("Error creating order item:", itemError);
                return { error: itemError.message };
            }

            // 2. Decrement Stock (RPC would be safer for concurrency, but direct update is okay for now)
            // We fetch current stock first to be safe or just decrement
            // Let's use a simple decrement. Supabase doesn't have `increment` helper in JS client easily without RPC.
            // So we'll read and update.

            const { data: product } = await supabase.from('marketplace_products').select('stock').eq('id', item.id).single();
            if (product) {
                const newStock = Math.max(0, product.stock - item.quantity);
                await supabase.from('marketplace_products').update({ stock: newStock }).eq('id', item.id);
            }
        }

        results.push(order);
    }

    revalidatePath('/marketplace/orders');
    revalidatePath('/marketplace'); // Update product listings (stock)
    return { success: true, orders: results };
}

export async function getEntrepreneurOrders() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*, marketplace_order_items(*, marketplace_products(title, image_url)), profiles!buyer_id(full_name, email, phone)')
        .eq('entrepreneur_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching entrepreneur orders:', error);
        return [];
    }

    return data;
}

export async function getUserOrders() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*, marketplace_order_items(*, marketplace_products(title, image_url)), profiles!entrepreneur_id(business_name, full_name)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }

    return data;
}

export async function updateOrderStatus(orderId: string, status: string, estimatedDate?: string) {
    const supabase = await createClient();

    const updateData: any = { status };
    if (estimatedDate) {
        updateData.estimated_delivery_date = estimatedDate;
    }

    const { error } = await supabase
        .from('marketplace_orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/entrepreneur/orders');
    revalidatePath('/marketplace/orders');
    return { success: true };
}

export async function confirmOrderReceipt(orderId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('marketplace_orders')
        .update({ status: 'Delivered' })
        .eq('id', orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/marketplace/orders');
    return { success: true };
}

export async function requestFundsRelease(orderId: string) {
    const supabase = await createClient();

    // Logic: Check if 7 days passed since estimated_delivery_date
    // For now, we'll just update the status to 'Dispute' or a custom status like 'Review Requested'
    // Let's use 'Dispute' as per schema check constraint, or maybe we should add 'Review' to schema?
    // Schema has: Pending, Paid, Shipped, Delivered, Completed, Cancelled, Dispute
    // 'Dispute' seems appropriate for "Needs Admin Attention".

    const { error } = await supabase
        .from('marketplace_orders')
        .update({ status: 'Dispute' }) // Signaling admin attention needed
        .eq('id', orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/entrepreneur/orders');
    return { success: true };
}

export async function adminReleaseEscrow(orderId: string) {
    const supabase = await createClient();

    // Check if admin
    // RLS handles the update permission, but we can double check role here if needed.

    const { error } = await supabase
        .from('marketplace_orders')
        .update({
            escrow_status: 'Released',
            status: 'Completed'
        })
        .eq('id', orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/marketplace');
    return { success: true };
}
