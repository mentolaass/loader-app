function BackgroundLayer({ children }: { children: JSX.Element }) {
    return (
        <div className={"dark bg-slate-900 font-inter text-foreground w-full h-screen"}>
             { children }
        </div>
    )
}

export default BackgroundLayer;