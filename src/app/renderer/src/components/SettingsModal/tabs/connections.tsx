import { providers } from "@/lib/api";
import { Header, Separator, Setting } from "../components";
import Tooltip from "@/components/Tooltip";

export default function Connections() {
    return (
        <>
            <Header title="Connections" subtitle="Syncronize your library with external accounts." />
            <Setting title="Link a new account" orientation="vertical" info="More sites will be added in the future.">
                <div className="flex flex-row flex-wrap gap-2">
                    {Object.getOwnPropertyNames(providers).map((key: string, index: number) => (
                        <ProviderButton key={index} code={key as keyof typeof providers} />
                    ))}
                </div>
            </Setting>
            <Separator />
        </>
    )
}

function ProviderButton({ code }: { code: keyof typeof providers }) {
    const provider = providers[code];

    return (
        <Tooltip label={provider.title} position="top" spacing={0.5}>
            <button>
                <img src={`/providers/${code}/icon.png`} className="h-8 w-8 object-cover object-center rounded" />
            </button>
        </Tooltip>
    )
}
