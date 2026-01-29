import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video, Star, GripVertical } from 'lucide-react';
import { clinicManagementService } from '../../lib/clinicManagementService';

interface ClinicMediaManagerProps {
  clinicId: string;
}

type TabType = 'images' | 'videos';
type ImageType = 'hero' | 'gallery' | 'before_after' | 'certificate' | 'facility';

export const ClinicMediaManager: React.FC<ClinicMediaManagerProps> = ({ clinicId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [images, setImages] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Image upload state
  const [imageType, setImageType] = useState<ImageType>('gallery');
  const [imageCaption, setImageCaption] = useState('');

  // Video add state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  useEffect(() => {
    if (activeTab === 'images') {
      loadImages();
    } else {
      loadVideos();
    }
  }, [activeTab, clinicId]);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await clinicManagementService.getClinicImages(clinicId);
    if (data) {
      setImages(data);
    }
    setLoading(false);
  };

  const loadVideos = async () => {
    setLoading(true);
    const { data } = await clinicManagementService.getClinicVideos(clinicId);
    if (data) {
      setVideos(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        await clinicManagementService.uploadClinicImage(
          clinicId,
          file,
          imageType,
          imageCaption
        );
      }

      setImageCaption('');
      loadImages();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoAdd = async () => {
    if (!videoUrl) return;

    setUploading(true);

    try {
      await clinicManagementService.addClinicVideo({
        clinic_id: clinicId,
        video_url: videoUrl,
        title: videoTitle,
        description: videoDescription,
      });

      setVideoUrl('');
      setVideoTitle('');
      setVideoDescription('');
      loadVideos();
    } catch (error) {
      console.error('Error adding video:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await clinicManagementService.deleteClinicImage(imageId);
      loadImages();
    }
  };

  const handleVideoDelete = async (videoId: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      await clinicManagementService.deleteClinicVideo(videoId);
      loadVideos();
    }
  };

  const toggleImageFeatured = async (image: any) => {
    await clinicManagementService.updateClinicImage(image.id, {
      is_featured: !image.is_featured,
    });
    loadImages();
  };

  const imageTypeLabels: Record<ImageType, string> = {
    hero: 'Hero Image',
    gallery: 'Gallery',
    before_after: 'Before/After',
    certificate: 'Certificate',
    facility: 'Facility',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Media Library</h2>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'images'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon size={16} className="inline mr-2" />
            Images
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'videos'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video size={16} className="inline mr-2" />
            Videos
          </button>
        </div>
      </div>

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Images</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image Type
                </label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value as ImageType)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Object.entries(imageTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-600 transition-colors">
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Your Images ({images.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p>No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Clinic image'}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => toggleImageFeatured(image)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          image.is_featured
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Star size={14} className="inline mr-1" />
                        {image.is_featured ? 'Featured' : 'Set Featured'}
                      </button>

                      <button
                        onClick={() => handleImageDelete(image.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Delete
                      </button>
                    </div>

                    {/* Image Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/60 text-white text-xs font-bold rounded">
                        {imageTypeLabels[image.image_type as ImageType]}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {image.is_featured && (
                      <div className="absolute top-2 right-2">
                        <Star size={20} className="fill-amber-500 text-amber-500" />
                      </div>
                    )}

                    {/* Caption */}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Add Video Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Video</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Video URL (YouTube, Vimeo)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe this video..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                onClick={handleVideoAdd}
                disabled={!videoUrl || uploading}
                className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Adding...' : 'Add Video'}
              </button>
            </div>
          </div>

          {/* Videos List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Your Videos ({videos.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Video size={48} className="mx-auto mb-4 opacity-30" />
                <p>No videos added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="w-32 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video size={32} className="text-slate-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 mb-1">
                        {video.title || 'Untitled Video'}
                      </h4>
                      {video.description && (
                        <p className="text-sm text-slate-600 mb-2">{video.description}</p>
                      )}
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline"
                      >
                        {video.video_url}
                      </a>
                    </div>

                    <button
                      onClick={() => handleVideoDelete(video.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
