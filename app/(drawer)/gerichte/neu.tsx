// Nur die relevante Änderung im pickImage:
async function pickImage(useCamera: boolean = false) {
  try {
    setUploadingImage(true);
    
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
      const file = result.assets[0];
      
      try {
        const publicUrl = await uploadDishImage(file.uri);
        setImageUrl(publicUrl);
      } catch (error) {
        console.error('Fehler beim Bildupload:', error);
        Alert.alert('Fehler', 'Das Bild konnte nicht hochgeladen werden.');
      }
    }
  } catch (error) {
    console.error('Fehler beim Bildupload:', error);
    Alert.alert('Fehler', 'Das Bild konnte nicht hochgeladen werden.');
  } finally {
    setUploadingImage(false);
  }
}