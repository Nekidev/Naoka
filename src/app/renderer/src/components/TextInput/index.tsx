import { cn } from "@/utils";

export default function TextInput({ name, icon, label, ...props }: { [key: string]: any }) {
    return (
        <div className="relative flex-1">
            {icon && (
                <div className="absolute top-0 bottom-0 left-2 my-auto h-fit">
                    {icon}
                </div>
            )}
            <input
                type="text"
                name={name}
                placeholder={label}
                autoComplete="off"
                className={cn([
                    "p-2 py-2.5 leading-none rounded bg-zinc-800 outline-none border",
                    "border-transparent focus:border-white transition placeholder:text-zinc-400",
                    "text-white/90 w-full",
                    ...(icon ? ["pl-10"] : []),
                ])}
                {...props}
            />
        </div>
    );
}
