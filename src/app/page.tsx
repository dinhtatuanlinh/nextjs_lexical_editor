'use client';
import LexicalEditor from '@/components/editor/lexicalEditor';
import { ImageResponse, ImageType } from '@/components/models/imagesModel';
import axios, { AxiosError } from 'axios';
import { useState, useRef } from 'react';
import { LexicalEditor as LexicalEditorInstance } from 'lexical';

const initialContent = undefined

export default function HomePage() {
	const [content, setContent] = useState('');
	const editorRef = useRef<LexicalEditorInstance | null>(null);

	const handleGetImages = async (pageNumber: number) => {
		try {
			const { data } = await axios.get<ImageResponse>(
				'http://localhost:3010/images',
				{
					headers: {
						'Content-Type': 'application/json',
						'x-request-id': '123',
					},
					params: {
						pageNumber,
						pageSize: 50,
					},
				}
			);
			return data;
		} catch (error) {
			const err = error as AxiosError;
			if (err.response) {
				console.error('Error status:', err.response.status);
				console.error('Response data:', err.response.data);
				return { images: [], totalPages: 0 };
			} else {
				console.error('Network error:', err.message);
				return { images: [], totalPages: 0 };
			}
		}
	};
	const handleUploadImage = async (file: File, fileName: string) => {
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('fileName', fileName);
			formData.append('type', 'image');
			await axios.post('http://localhost:3010/images', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
		} catch (error) {
			const err = error as AxiosError;
			if (err.response) {
				console.error('Error status:', err.response.status);
				console.error('Response data:', err.response.data);
			} else {
				console.error('Network error:', err.message);
			}
		}
	};
	return (
		<main className="p-4">
			<h1 className="text-xl font-bold mb-4">
				Lexical Editor in Next.js
			</h1>
			<div className="bg-slate-100 py-10">
				<LexicalEditor<ImageType, ImageResponse>
					ref={editorRef}
					apiHost={'http://localhost:3010'}
					onChange={setContent}
					handleGetImages={handleGetImages}
					handleUploadImage={handleUploadImage}
					initialContent={initialContent}
				/>
			</div>
			<button
				onClick={() => {
					if (editorRef.current) {
						const json = editorRef.current
							.getEditorState()
							.toJSON();
						const jsonString = JSON.stringify(json, null, 2);
						console.log('Editor JSON:', jsonString);
					}
				}}
			>
				Save as JSON
			</button>
			<div>
				<div
					className="prose"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>
		</main>
	);
}
