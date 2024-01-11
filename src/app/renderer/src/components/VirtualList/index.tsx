import React from "react";

export default function VirtualList({
    items,
    component,
    componentSize,
    overscan = 1,
    ...props
}: {
    items: any[];
    component: (options: { item: any; index: number }) => React.JSX.Element;
    componentSize: number;
    overscan?: number;
    [key: string]: any;
}) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const style = { ...(props.style ?? {}), overflow: "auto" };
    delete props.style;

    const [renderFrom, setRenderFrom] = React.useState(
        0
    );
    const [renderTo, setRenderTo] = React.useState(
        containerRef.current?.offsetHeight! / componentSize
    );

    React.useEffect(() => {
        function handleScroll(e: any) {
            const rf = Math.floor(e.target.scrollTop / componentSize);
            const rt = rf + Math.ceil(e.target.offsetHeight / componentSize);

            const rfState = Math.max(rf - overscan, 0);
            const rtState = Math.min(rt + overscan, items.length);

            if (renderFrom != rfState) {
                setRenderFrom(rfState);
            }

            if (renderTo != rtState) {
                setRenderTo(rtState);
            }
        }

        if (containerRef.current) {
            containerRef.current.addEventListener("scroll", handleScroll);

            handleScroll({ target: containerRef.current });
        }

        return () => {
            containerRef.current?.removeEventListener("scroll", handleScroll);
        };
    }, [renderFrom, renderTo, items]);

    return (
        <div ref={containerRef} style={style} {...props}>
            <div>
                <div
                    style={{
                        height: `${renderFrom * componentSize}px`,
                    }}
                ></div>
            </div>
            {items
                .slice(renderFrom, renderTo)
                .map((item, index) => component({ item, index }))}
            <div>
                <div
                    style={{
                        height: `${
                            (items.length - renderTo) * componentSize
                        }px`,
                    }}
                ></div>
            </div>
        </div>
    );
}
