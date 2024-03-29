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

  async saveImage(fileName: string, photo: any) {
    const base64 = await this.readAsBase64(photo);

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64.data,
      directory: Directory.Data
    });

    return fileName;
  }

  async saveLocalLogo(photo: any) {
    return await this.saveImage('logo.jpeg', photo);
  }

  async saveLocalAuditoryEvidence(photo: any, id: string) {
    return await this.saveImage(`${id}-AUD${this.generateName()}`, photo);
  }

  async saveLocalHelmetAuditoryEvidence(photo: any, id: string) {
    return await this.saveImage(`${id}-HEL${this.generateName()}`, photo);
  }

  async saveLocalBeltAuditoryEvidence(photo: any, id: string) {
    return await this.saveImage(`${id}-BEL${this.generateName()}`, photo);
  }

  async saveLocalGeneralCountAuditoryEvidence(photo: any, id: string) {
    return await this.saveImage(`${id}-GCO${this.generateName()}`, photo);
  }

  async saveLocalAnswerEvidence(photo: any, auditoryId: string, sectionId: string) {
    return await this.saveImage(`${auditoryId}-ANS${sectionId}-${this.generateName()}`, photo);
  }

  getLocalEvidence(id: string) {
    return Filesystem.readFile({
      path: id,
      directory: Directory.Data
    })
  }

  getLocalEvidenceUri(id: string) {
    return Filesystem.getUri({
      path: id,
      directory: Directory.Data
    })
  }

  removeLocalEvidence(dir: string) {
    return Filesystem.deleteFile({
      path: dir,
      directory: Directory.Data
    })
  }

  generateName() {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const lengthOfCode = 64;

    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return `${text}.png`;
  }

  async getLocalLogo() {
    return await this.getLocalEvidence('logo.jpeg');
  }

  async getLocalLogoUri() {
    return await this.getLocalEvidenceUri('logo.jpeg');
  }

  private async readAsBase64(data: any) {
    return await Filesystem.readFile({
      path: data.path!
    })
  }

}
