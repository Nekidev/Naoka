"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace("/app/library/");
    }, []);

    return <main></main>;
}
