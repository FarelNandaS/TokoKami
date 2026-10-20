import { ChangeEvent, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from "@/components/ui/attachment";
import { FileTextIcon, XIcon } from "lucide-react";

export interface ExistingFile {
    id: number;
    url: string;
    name: string;
    size: string;
    isImage: boolean;
}

interface FileUploadInputProps {
    value: File[];
    onChange: (files: File[]) => void;
    initialFiles?: ExistingFile[];
    onRemoveExisting?: (id: number) => void;
    error?: string;
    accept?: string;
    multiple?: boolean; // <-- Tambahan prop untuk mengatur single / multiple
}

interface FilePreview {
    id?: number; 
    file?: File; 
    url: string;
    name: string;
    size: string;
    isImage: boolean;
    isNew: boolean;
}

export function InputFile({
    value,
    onChange,
    initialFiles = [],
    onRemoveExisting,
    error,
    accept = "image/png, image/jpeg, image/jpg, image/webp, application/pdf",
    multiple = false, // Default-nya true (bisa banyak file)
}: FileUploadInputProps) {
    const [previews, setPreviews] = useState<FilePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inisialisasi awal saat komponen / modal dibuka
    useEffect(() => {
        const mappedExisting: FilePreview[] = initialFiles.map((item) => ({
            id: item.id,
            url: item.url,
            name: item.name,
            size: item.size,
            isImage: item.isImage,
            isNew: false,
        }));
        setPreviews(mappedExisting);
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        if (!multiple) {
            // ==========================================
            // KONDISI 1: SINGLE FILE (Hanya boleh 1 file)
            // ==========================================
            // Jika sebelumnya ada file lama (initialFiles), tandai untuk dihapus di backend
            if (initialFiles.length > 0 && onRemoveExisting) {
                initialFiles.forEach((item) => onRemoveExisting(item.id));
            }

            // Ambil file pertama saja jika user memilih banyak
            const singleFile = [fileArray[0]];
            onChange(singleFile);

            const file = fileArray[0];
            const sizeInKb = (file.size / 1024).toFixed(1);
            const formattedSize =
                Number(sizeInKb) > 1024
                    ? `${(Number(sizeInKb) / 1024).toFixed(1)} MB`
                    : `${sizeInKb} KB`;
            const isImage = file.type.startsWith("image/");

            const newPreview: FilePreview = {
                file,
                url: isImage ? URL.createObjectURL(file) : "",
                name: file.name,
                size: formattedSize,
                isImage,
                isNew: true,
            };

            // Timpa preview lama dengan file baru ini saja
            setPreviews([newPreview]);
        } else {
            // ==========================================
            // KONDISI 2: MULTIPLE FILES (Bisa banyak file)
            // ==========================================
            const updatedFiles = [...value, ...fileArray];
            onChange(updatedFiles);

            const mappedNew: FilePreview[] = fileArray.map((file) => {
                const sizeInKb = (file.size / 1024).toFixed(1);
                const formattedSize =
                    Number(sizeInKb) > 1024
                        ? `${(Number(sizeInKb) / 1024).toFixed(1)} MB`
                        : `${sizeInKb} KB`;
                const isImage = file.type.startsWith("image/");
                return {
                    file,
                    url: isImage ? URL.createObjectURL(file) : "",
                    name: file.name,
                    size: formattedSize,
                    isImage,
                    isNew: true,
                };
            });

            setPreviews((prev) => [...prev, ...mappedNew]);
        }

        e.target.value = "";
    };

    const handleRemove = (index: number) => {
        const target = previews[index];

        if (!target.isNew && target.id) {
            if (onRemoveExisting) {
                onRemoveExisting(target.id);
            }
        } else {
            const newFilesOnly = previews.filter((p) => p.isNew);
            const targetNewIndex = newFilesOnly.findIndex((p) => p.url === target.url);

            if (targetNewIndex !== -1) {
                const updatedFiles = value.filter((_, idx) => idx !== targetNewIndex);
                onChange(updatedFiles);
            }
        }

        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Atribut multiple pada tag input HTML disesuaikan dengan prop */}
            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer hover:bg-muted/50"
            >
                <span className="text-muted-foreground truncate">
                    {previews.length > 0
                        ? `${previews.length} file dipilih`
                        : "Pilih file..."}
                </span>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs px-2 pointer-events-none"
                >
                    Browse
                </Button>
            </div>

            {error && <span className="text-xs text-destructive">{error}</span>}

            <div className="flex flex-col gap-2 mt-1">
                {previews.map((item, index) => (
                    <Attachment key={index} className="w-full">
                        {item.isImage ? (
                            <AttachmentMedia variant="image">
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </AttachmentMedia>
                        ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                <FileTextIcon className="h-5 w-5" />
                            </div>
                        )}
                        <AttachmentContent>
                            <AttachmentTitle>{item.name}</AttachmentTitle>
                            <AttachmentDescription>
                                {item.isNew ? item.size : 'Tersimpan (Lama)'}
                            </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                            <AttachmentAction
                                type="button"
                                aria-label="Remove File"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                            >
                                <XIcon className="h-4 w-4" />
                            </AttachmentAction>
                        </AttachmentActions>
                    </Attachment>
                ))}
            </div>
        </div>
    );
}