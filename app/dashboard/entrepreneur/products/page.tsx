import { createClient } from '@/utils/supabase/server';
import CreateProductForm from '@/components/marketplace/CreateProductForm';
import EntrepreneurProductList from '@/components/marketplace/EntrepreneurProductList';

export default async function EntrepreneurProductsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: products } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('entrepreneur_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <CreateProductForm />
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Products</h2>
                <EntrepreneurProductList initialProducts={products || []} />
            </div>
        </div>
    );
}
