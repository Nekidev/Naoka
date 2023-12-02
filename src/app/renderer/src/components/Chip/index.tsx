export default function Chip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: any;
}) {
    return (
        <button
            className={
                "text-sm leading-none py-2 px-4 rounded-full transition " +
                (selected
                    ? "bg-zinc-100 hover:bg-zinc-300 text-zinc-900"
                    : "bg-zinc-800 hover:bg-zinc-700")
            }
            onClick={onClick}
        >
            {label}
        </button>
    );
}
