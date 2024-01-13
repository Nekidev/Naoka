import React from "react";

export default function VirtualList({
    items,
    component,
    componentSize,
    overscan = 10,
    updateEvery = 5,
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

    const [[renderFrom, renderTo], setRenderRange] = React.useState([
        0,
        containerRef.current?.offsetHeight! / componentSize,
    ]);

    React.useEffect(() => {
        function handleScroll(e: any, force = false) {
            const rf = Math.floor(e.target.scrollTop / componentSize);
            const rt = rf + Math.ceil(e.target.offsetHeight / componentSize);

            const rfState = Math.max(rf - overscan, 0);
            const rtState = Math.min(rt + overscan, items.length);

            if (renderFrom != rfState || renderTo != rtState) {
                if (
                    force ||
                    Math.abs(renderFrom - rfState) > updateEvery ||
                    Math.abs(renderTo - rtState) > updateEvery
                ) {
                    setRenderRange([rfState, rtState]);
                }
            }
        }

        if (containerRef.current) {
            containerRef.current.addEventListener("scroll", handleScroll);
            handleScroll({ target: containerRef.current }, true);
        }

        return () => {
            containerRef.current?.removeEventListener("scroll", handleScroll);
        };
    }, [renderFrom, items]);

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
