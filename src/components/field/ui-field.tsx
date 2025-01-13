import { TooltipTrigger, Tooltip, TooltipContent } from "../ui/tooltip";

function UiField({ tooltip, value, icon }: { tooltip: string, value: any, icon: JSX.Element }) {
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger>
                <div className="bg-slate-950 hover:scale-90 hover:opacity-80 rounded-3xl transition-all cursor-default flex gap-3 w-full items-center p-2">
                    {icon}
                    {value}
                </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-950 rounded-3xl font-inter text-white">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export default UiField;