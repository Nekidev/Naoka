import { useLocalStorage } from "@uidotdev/usehooks";

export function useSidebarExpanded(): [boolean, (value: boolean) => void] {
    const [isExpanded, setIsExpanded] = useLocalStorage(
        "Naoka:SideBar:Expanded",
        "true"
    );

    return [
        isExpanded === "true",
        (value: boolean) => {
            setIsExpanded(value.toString());
        },
    ];
}
