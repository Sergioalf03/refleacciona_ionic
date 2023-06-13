import { Injectable } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(
    // private actionSheetController: ActionSheetController,
    // private imagePicker: ImagePicker,
  ) { }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;

    // Can be set to the src of an image now
  };

  openGallery = async (imageUrl: any) => {
    return await Camera.pickImages({
      quality: 90,
    });
  };

  openFileExplore() {
    const readSecretFile = async () => {
      const contents = await Filesystem.readFile({
        path: 'secrets/text.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

    };
  }

  pickImage() {
    // return Camera
    //   .checkPermissions()
    //   .then(res => {
    //     if (res.camera !== 'granted' || res.photos !== 'granted') {
    //       return Camera
    //         .requestPermissions()
    //         .then(() => {
    //           return Camera.getPhoto({
    //             quality: 10,
    //             source: CameraSource.Prompt,
    //             promptLabelHeader: 'Seleccionar Imagen',
    //             promptLabelPhoto: 'Galería',
    //             promptLabelPicture: 'Cámara',
    //             promptLabelCancel: 'Cancelar',
    //             allowEditing: false,

    //             saveToGallery: false,
    //             correctOrientation: true,
    //             resultType: CameraResultType.DataUrl
    //           });
    //         })
    //         .catch(err => console.log(err));
    //     } else {
    //       return Camera.getPhoto({
    //         quality: 10,
    //         source: CameraSource.Prompt,
    //         promptLabelHeader: 'Seleccionar Imagen',
    //         promptLabelPhoto: 'Galería',
    //         promptLabelPicture: 'Cámara',
    //         promptLabelCancel: 'Cancelar',
    //         allowEditing: false,

    //         saveToGallery: false,
    //         correctOrientation: true,
    //         resultType: CameraResultType.DataUrl
    //       });
    //     }
    //   })
    //   .catch(err => console.log(err));
  }

  async saveLocalLogo(photo: any) {
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = 'logo.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
  }

  async saveLocalEvidence(photo: any, auditoryId: string) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = `${auditoryId}-${this.generateName()}`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return fileName;
  }

  generateName() {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.-_*&%$#@!";
    const lengthOfCode = 20;

    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  getLocalLogo() {
    return Filesystem.readFile({
      path: 'logo.jpeg',
      encoding: Encoding.UTF8,
      directory: Directory.Data
    })

  }

  private async readAsBase64(blob: any) {
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async onTakePicture(index: number) {
    // const actionSheet = await this.actionSheetController.create({
    //   header: 'Opciones',
    //   buttons: [
    //     {
    //       text: 'Cámara',
    //       icon: 'camera-outline',
    //       handler: () => this.cameraService.takePicture()
    //         .then((result: any) => {
    //           if (result) {

    //             this.loadingService.showLoading();
    //             this.locationService
    //               .getLocation()
    //               .then((locationRes: any) => this.uploadImage(index, result.dataUrl, locationRes))
    //               .catch(err => this.responseHandlerService.errorResponse(err, 'No se pudo obtener la ubicación del dispositivo'));
    //           }
    //         })
    //         .catch(err => this.responseHandlerService.errorResponse(err, 'No se pudo obtener la imagen'))
    //     },
    //     {
    //       text: 'Galería',
    //       icon: 'image-outline',
    //       handler: () => this.cameraService.openGallery()
    //         .then((result: any) => {
    //           if (result) {
    //             this.uploadImage(index, result.dataUrl);
    //           }
    //         })
    //         .catch(err => this.responseHandlerService.errorResponse(err, 'No se pudo obtener la imagen')),
    //     },
    //     {
    //       text: 'Regresar',
    //       icon: 'return-up-back-outline',
    //     }
    //   ],
    // });

    // await actionSheet.present();
  }
}
