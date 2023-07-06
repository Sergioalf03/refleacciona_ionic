import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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
    return await Camera.getPhoto({
      quality: 90,
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri
    });
  };

  openGallery = async () => {
    return await Camera.pickImages({
      quality: 90,
      limit: 1,
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

  async saveLocalAuditoryEvidence(photo: any, id: string) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = `${id}-AUD${this.generateName()}`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return fileName;
  }

  async saveLocalAnswerEvidence(photo: any, auditoryId: string, sectionId: string) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = `${auditoryId}-ANS${sectionId}-${this.generateName()}`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return fileName;
  }

  getLocalAuditoryEvidence(id: string) {
    return Filesystem.readFile({
      path: id,
      encoding: Encoding.UTF8,
      directory: Directory.Data
    })
  }

  getLocalAnswerEvidence(id: string) {
    return Filesystem.readFile({
      path: id,
      encoding: Encoding.UTF8,
      directory: Directory.Data
    })
  }

  removeLocalAuditoryEvidence(dir: string) {
    return Filesystem.deleteFile({
      path: dir,
      directory: Directory.Data
    })
  }

  removeLocalAnswerEvidence(dir: string) {
    return Filesystem.deleteFile({
      path: dir,
      directory: Directory.Data
    })
  }

  generateName() {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
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
