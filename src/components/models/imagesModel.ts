export interface ImageResponse {
	images: ImageType[];
	totalPages: number;
}
export interface ImageType {
	imageId: number;
	name: string;
	link: string;
	type: string;
}
