import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {

  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/];

  @ViewChild('scanner', { static: false })
  scanner: ZXingScannerComponent;


  kameraSecildi: boolean = false;
  aygitListesi: string[] = ['Video device 1', 'Video device 2', 'Video device 3', 'Video device 4']
  hasCameras = false;
  hasPermission: boolean;
  qrResultString: string;
  goster: boolean = false;

  barcode: string;
  koordinat: GeolocationCoordinates = null;

  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo;

  stream: MediaStream;
  videoElement: any;

  ngOnInit(): void {

    
    navigator.geolocation.getCurrentPosition((success) => {
      this.koordinat = success.coords;
      console.log(this.koordinat);

    });

    this.getConnectedDevices().then((aygitlar) => {
      aygitlar.forEach(item => {
        this.availableDevices.push(item);
      })
    }).catch((hata) => {
      console.log(hata);
    });

  }

  async getConnectedDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(p => p.kind == 'videoinput');
  }


  scanSuccessHandler(e: any) {
    console.log(e);

    if (e != undefined) {
      let soz = new Promise((resolve) => {
        resolve(e);
      }).then(p => {
        this.readBarcode(p.toString());
      })
    }
  }

  readBarcode(barcode: string) {
    if (barcode != null) {
      if (barcode.toString().length > 0) {
        this.barcode = barcode;
      }
    }

  }

  onDeviceSelectChange(selected: string) {
    console.log('Selection changed: ', selected);
    if (selected.length > 0) this.kameraSecildi = true;
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.selectedDevice = device || null;

  }

  // onDeviceSelectChange(selectedValue: string) {
  //     console.log('Selection changed: ', selectedValue);
  //     this.selectedDevice = this.scanner.getDeviceById(selectedValue);
  // }

  async playVideoFromCamera(goruntu: boolean, ses: boolean) {
    try {
      if (this.goster) {
        const constraints = { 'video': goruntu, 'audio': ses };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoElement = document.querySelector('video#localVideo');
        this.videoElement.srcObject = this.stream;
      }

    } catch (error) {
      console.error('Error opening video camera.', error);
    }
  }

  start() {
    this.goster = true;
    this.playVideoFromCamera(true, false);
  }

  //catch picture
  catch() {

    let canvas: any = document.getElementById('resim');
    let video: any = document.getElementById('localVideo');

    canvas.width = 640;
    canvas.height = 480;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let image = canvas.toDataURL();//canvas.toDataURL('image/jpeg');

  }

  stop() {
    this.goster = false;

    const tracks = this.stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    this.videoElement.srcObject = null;
  }

  saveImage() {
    const indir: any = document.createElement('a');
    let canvas: any = document.getElementById('resim'); 
    //find image element and set url for download
    indir.href = canvas.toDataURL();

    indir.download = "resimi-indir";// name of image
    indir.click();
    indir.romove();
  }

}