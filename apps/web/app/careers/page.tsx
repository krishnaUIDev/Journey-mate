import { supabase } from "../../lib/supabase";
import CareersClient from "./CareersClient";

export const revalidate = 60; // revalidate every 60 seconds

export default async function CareersPage() {
    if (!supabase) return <CareersClient jobs={[]} />;

    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    return <CareersClient jobs={(jobs as any) ?? []} />;
}
