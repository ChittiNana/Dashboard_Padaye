// Default profile picture is an emoji matching the selected gender, used
// whenever no photo was uploaded. Shared by Registration (live preview while
// filling the form) and Login (preview once a matching username is typed).
export const GENDER_AVATAR_EMOJI = { Male: '👨', Female: '👩', Other: '🧑' };

export function genderAvatarEmoji(gender) {
  return GENDER_AVATAR_EMOJI[gender] || '👤';
}

// A raw phone photo can be several MB — stored as-is, that bloats
// localStorage fast (quota is typically ~5-10MB per origin) and slows down
// every single write anywhere in the app, since the mock store re-serializes
// its *entire* contents on every save. Downscaled + recompressed to a small
// square JPEG instead, since avatars only ever render at a few dozen pixels
// anyway — this keeps a photo to a few KB rather than a few MB.
const AVATAR_MAX_SIZE = 128;
const AVATAR_JPEG_QUALITY = 0.82;

export function fileToProfileImage(file, maxSize = AVATAR_MAX_SIZE) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext('2d');
      // Cover-fit crop to a square so every photo fills the circular avatar cleanly.
      const scale = Math.max(maxSize / img.width, maxSize / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (maxSize - w) / 2, (maxSize - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image file')); };
    img.src = url;
  });
}
