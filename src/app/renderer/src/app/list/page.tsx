"use client";

import { LeftNavSpacer, VerticalNavSpacer } from "@/components/NavigationBar";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useSearchParams } from "next/navigation";

export default function List() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const list = useLiveQuery(() => db.lists.get(id!), [id]);

    return (
        <main className="flex flex-col min-h-full max-h-full overflow-y-auto">
            <div className="sticky top-0 shrink-0 bg-zinc-900 z-10">
                <div className="flex flex-row items-center">
                    <VerticalNavSpacer />
                    <LeftNavSpacer />
                </div>
            </div>
        </main>
    );
}
