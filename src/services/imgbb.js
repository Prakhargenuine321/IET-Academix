export const uploadToImgbb = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  // Replace YOUR_IMGBB_API_KEY with your actual key
  const res = await fetch(`https://api.imgbb.com/1/upload?key=4e6b6ec20a830d7316a1fbbd95919c84`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.data.url;
};