// Logo Mastervendas em base64
// Convertida de: public/logo-mastervendas.png
export const MASTERVENDAS_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Esta será preenchida no build time ou em tempo de execução
export async function getLogoBase64(): Promise<string> {
  try {
    // Tenta carregar do servidor
    const response = await fetch('/logo-mastervendas.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Erro ao carregar logo, usando padrão:', error);
    return MASTERVENDAS_LOGO;
  }
}
