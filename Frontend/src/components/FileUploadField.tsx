import React, { useRef } from "react";
import { Upload, X } from "lucide-react";

interface FileUploadFieldProps {
	label: string;
	name: string;
	file: File | null;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	accept?: string;
}

function FileUploadField({
	label,
	name,
	file,
	onChange,
	disabled = false,
	accept = "image/*",
}: FileUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragActive, setIsDragActive] = React.useState(false);

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
		e.stopPropagation();
		if (inputRef.current) {
			inputRef.current.value = "";
			// Trigger change event
			const event = new Event("change", { bubbles: true });
			const fileInput = inputRef.current as any;
			fileInput.files = new DataTransfer().files;
			inputRef.current.dispatchEvent(event);
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
					<div className="text-center w-full">
						<div className="flex items-center justify-center mb-2">
							<span className="text-2xl">✓</span>
						</div>
						<p className="text-sm font-medium text-gray-700 break-words px-2">
							{file.name}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{(file.size / 1024 / 1024).toFixed(2)}{" "}
							MB
						</p>
						{!disabled && (
							<button
								onClick={handleClear}
								className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto"
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
