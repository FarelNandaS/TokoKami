import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

export function Modal({
    btnTrigger,
    title,
    desc,
    btnCloseText,
    children,
    open,
    onOpenChange,
}: {
    btnTrigger: ReactNode;
    title?: string;
    desc?: string;
    btnCloseText?: string;
    children?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {btnTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {title || desc ? <DialogHeader>
                    {title ? <DialogTitle>{title}</DialogTitle> : null}
                    {desc ? <DialogDescription>{desc}</DialogDescription> : null}
                </DialogHeader> : null}
                {children}
                {btnCloseText ? <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button">{btnCloseText}</Button>
                    </DialogClose>
                </DialogFooter> : null}
            </DialogContent>
        </Dialog>
    );
}
