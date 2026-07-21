import React, { useRef, useEffect, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadFieldProps {
	label: string;
	name: string;
	file: File | null;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClear?: () => void;
	disabled?: boolean;
	accept?: string;
}

function FileUploadField({
	label,
	name,
	file,
	onChange,
	onClear,
	disabled = false,
	accept = "image/*",
}: FileUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragActive, setIsDragActive] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (file && file.type.startsWith("image/")) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
		setPreviewUrl(null);
	}, [file]);

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);

		if (disabled) return;

		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles && droppedFiles[0]) {
			const event = {
				target: {
					name,
					files: droppedFiles,
				},
			} as any;
			onChange(event);
		}
	};

	const handleClick = () => {
		if (!disabled) {
			inputRef.current?.click();
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (inputRef.current) {
			const fileInput = inputRef.current as any;
			// Clear the input's files
			fileInput.files = new DataTransfer().files;
			inputRef.current.value = "";

			// Call onClear callback if provided, otherwise use onChange
			if (onClear) {
				onClear();
			} else {
				// Notify parent via the provided onChange handler with an empty files list
				const changeEvent = {
					target: {
						name,
						files: fileInput.files,
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;

				onChange(changeEvent);
			}
		}
	};

	return (
		<div>
			<label className="text-sm font-medium mb-3 flex items-center gap-2">
				{/* {file ? (
					<span className="text-green-600">✓</span>
				) : (
					<span className="text-gray-400">📎</span>
				)} */}
				{label}
			</label>
			<div
				onClick={handleClick}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={`
					relative border-2 border-dashed rounded-lg p-6 cursor-pointer
					transition-all duration-300 flex flex-col items-center justify-center
					min-h-[120px]
					${
						isDragActive
							? "border-blue-500 bg-blue-50"
							: file
								? "border-green-300 bg-green-50"
								: "border-gray-300 hover:border-gray-400 bg-gray-50"
					}
					${disabled ? "opacity-50 cursor-not-allowed" : ""}
				`}
			>
				<input
					ref={inputRef}
					type="file"
					name={name}
					accept={accept}
					onChange={onChange}
					disabled={disabled}
					className="hidden"
				/>

				{file ? (
					<div
						className="text-center w-full"
						onClick={(e) => e.stopPropagation()}
					>
						{previewUrl ? (
							<img
								src={previewUrl}
								alt={file.name}
								className="max-h-24 mx-auto mb-2 rounded object-contain"
							/>
						) : (
							<FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
						)}
						<p className="text-sm font-medium text-gray-700 wrap-break-word px-2">
							{file.name}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{(file.size / 1024 / 1024).toFixed(2)}{" "}
							MB
						</p>
						{!disabled && (
							<button
								onClick={handleClear}
								className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto hover:cursor-pointer	"
							>
								<X className="w-3 h-3" />
								إزالة
							</button>
						)}
					</div>
				) : (
					<div className="text-center">
						<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
						<p className="text-sm font-medium text-gray-600">
							رفع ملف
						</p>
						<p className="text-xs text-gray-500 mt-1">
							اسحب الملف هنا أو انقر للاختيار
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default FileUploadField;
