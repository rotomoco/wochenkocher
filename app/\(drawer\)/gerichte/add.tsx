// Nur die relevanten Änderungen im pickImage:
async function pickImage(useCamera: boolean = false) {
  try {
    // Berechtigungen prüfen
    if (Platform.OS !== 'web') {
      const { status } = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
        
      if (status !== 'granted') {
        Alert.alert('Fehler', 'Wir benötigen Zugriff auf die Kamera/Mediathek.');
        return;
      }
    }

    // Bild auswählen
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

    if (!result.canceled) {
      // Bild zu Supabase Storage hochladen
      const file = result.assets[0];
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Konvertiere das Bild in einen Blob für den Upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dish-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Öffentliche URL des Bildes erhalten
      const { data: { publicUrl } } = supabase.storage
        .from('dish-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    }
  } catch (error) {
    console.error('Fehler beim Bildupload:', error);
    Alert.alert('Fehler', 'Das Bild konnte nicht hochgeladen werden.');
  }
}