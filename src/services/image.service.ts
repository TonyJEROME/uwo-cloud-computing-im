import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { postImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Initialize Google Cloud Storage client
const storage = new Storage();
const bucketName = 'bucket_pic_ece9016_zhiyuan';

export class ImageService {
    static async uploadImage(file: Buffer, fileName: string, postId: string) {
        try {
            console.log("Starting image upload to GCS for post:", postId);
            
            // Validate postId is not undefined
            if (!postId) {
                console.error('Error: Attempting to upload image with undefined postId');
                throw new Error('Cannot upload image: Post ID is undefined');
            }
            
            // Generate a unique filename
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            console.log("Generated unique filename:", uniqueFileName);
            
            // Reference to the bucket
            const bucket = storage.bucket(bucketName);
            const blob = bucket.file(uniqueFileName);
            
            // Upload the file
            console.log("Saving file to GCS...");
            await blob.save(file);
            console.log("File saved to GCS successfully");
            
            // Skip making the file public individually since uniform bucket-level access is enabled
            // The bucket itself must be publicly readable
            console.log("Using bucket-level access settings (uniform access enabled)");
            
            // Get the public URL - this will work if the bucket is publicly readable
            const imageUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`;
            console.log("Generated public URL:", imageUrl);
            
            // Save reference to database
            console.log("Saving image record to database...");
            const [imageRecord] = await db.insert(postImages).values({
                postId,
                imageUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            console.log("Image record saved to database:", imageRecord);
            
            return imageRecord;
        } catch (error) {
            console.error('Detailed error in uploadImage:', error);
            // Check for GCS specific errors
            if (error instanceof Error) {
                if (error.message.includes('does not have storage.objects')) {
                    console.error('GCS permission error: The service account lacks required permissions');
                } else if (error.message.includes('No such object')) {
                    console.error('GCS error: The specified bucket does not exist');
                } else if (error.message.includes('uniform bucket-level access')) {
                    console.error('GCS permission error: Bucket has uniform access control enabled, cannot set object-level ACLs');
                }
                throw new Error(`Image upload failed: ${error.message}`);
            }
            throw error;
        }
    }
    
    static async getImagesForPost(postId: string) {
        return await db.query.postImages.findMany({
            where: (postImages, { eq }) => eq(postImages.postId, postId),
            orderBy: (fields, { asc }) => [asc(fields.createdAt)]
        });
    }
    
    static async deleteImage(imageId: string) {
        // Get the image record to find the file URL
        const image = await db.query.postImages.findFirst({
            where: (postImages, { eq }) => eq(postImages.imageId, imageId)
        });
        
        if (!image) {
            throw new Error('Image not found');
        }
        
        // Extract filename from URL
        const fileName = image.imageUrl.split('/').pop();
        
        // Delete from GCS
        if (fileName) {
            const file = storage.bucket(bucketName).file(fileName);
            await file.delete();
        }
        
        // Delete from database
        await db.delete(postImages).where(eq(postImages.imageId, imageId));
        
        return { success: true };
    }

    static async associateImageWithPost(imageId: string, postId: string) {
        // Update the image record to link it to the new post
        await db.update(postImages)
            .set({ 
                postId,
                updatedAt: new Date()
            })
            .where(eq(postImages.imageId, imageId));
            
        return { success: true };
    }
} 