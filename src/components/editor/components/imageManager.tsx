import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ImageManagerProps<
	T extends { imageId: number; name: string; link: string; type: string },
	R extends { images: T[]; totalPages: number }
> {
	open: boolean;
	onClose: () => void;
	apiHost: string;
	onSelect: (url: string, alignment?: 'left' | 'center' | 'right') => void;
	//   type: "post" | "tag" | "category";
	handleGetImages: (pageNumber: number) => Promise<R>;
	handleUploadImage: (file: File, fileName: string) => Promise<void>;
}

export default function ImageManager<
	T extends { imageId: number; name: string; link: string; type: string },
	R extends { images: T[]; totalPages: number }
>({
	open,
	onClose,
	handleGetImages,
	apiHost,
	handleUploadImage,
	onSelect,
}: ImageManagerProps<T, R>) {
	const [images, setImages] = useState<T[]>([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [uploading, setUploading] = useState(false);
	const [fileName, setFileName] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) {
			handleGetImages(pageNumber).then((data) => {
				setImages(data.images);
				setTotalPages(data.totalPages);
			});
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [open, pageNumber]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [open, onClose]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			// Set a default filename based on the uploaded file
			setFileName(file.name.replace(/\.[^/.]+$/, ''));
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !fileName.trim()) return;
		setUploading(true);
		try {
			await handleUploadImage(selectedFile, fileName.trim());
			setFileName('');
			setSelectedFile(null);
			handleGetImages(pageNumber);
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Overlay */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

			{/* Modal */}
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10"
			>
				{/* Header */}
				<div className="p-4 border-b flex justify-between items-center bg-gray-50">
					<h2 className="text-lg font-semibold text-gray-800">
						Image Manager
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						✕
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Upload Section */}
					<div className="mb-6 p-4 bg-gray-50 rounded-lg border">
						<div className="flex flex-wrap gap-4 items-end">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileChange}
							/>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Select Image
								</label>
								<button
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
									onClick={() =>
										fileInputRef.current?.click()
									}
									disabled={uploading}
									type="button"
								>
									Choose File
								</button>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									File Name
								</label>
								<input
									type="text"
									placeholder="Enter filename"
									value={fileName}
									onChange={(e) =>
										setFileName(e.target.value)
									}
									className="border rounded-md px-3 py-2 w-64"
									disabled={uploading}
								/>
							</div>
							<button
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
								onClick={handleUpload}
								disabled={
									uploading ||
									!selectedFile ||
									!fileName.trim()
								}
								type="button"
							>
								{uploading ? 'Uploading...' : 'Upload'}
							</button>
						</div>
						{selectedFile && (
							<div className="mt-2 text-sm text-gray-600">
								Selected file: {selectedFile.name}
							</div>
						)}
					</div>

					{/* Image Grid */}
					<div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4 overflow-y-auto max-h-[400px]">
						{images.map((img) => (
							<div
								key={img.imageId}
								className="group relative aspect-video border rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all"
								onClick={() =>
									onSelect(`${apiHost}/${img.link}`)
								}
							>
								<div className="relative w-full h-full min-h-[120px]">
									<Image
										src={`${apiHost}/${img.link}`}
										alt={img.name}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, 256px"
									/>
								</div>
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
									<div className="w-full p-2 text-white text-sm truncate bg-black/60">
										{img.name}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					<div className="flex justify-between items-center pt-4 border-t">
						<button
							type="button"
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
							disabled={pageNumber <= 1}
							onClick={() => setPageNumber(pageNumber - 1)}
						>
							Previous
						</button>
						<span className="text-sm text-gray-600">
							Page {pageNumber} of {totalPages}
						</span>
						<button
							type="button"
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
							disabled={pageNumber >= totalPages}
							onClick={() => setPageNumber(pageNumber + 1)}
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
