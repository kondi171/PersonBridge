import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private sound: Howl | null = null;

    playSound(url: string): void {
        this.sound = new Howl({
            src: [url]
        });
        this.sound.play();
    }
    stopSound(): void {
        if (this.sound) {
            this.sound.stop();
        }
    }

    playSuccessSound() {
        const src = './../../assets/audio/operation-success.wav'
        this.sound = new Howl({

            src: [src]
        })
        this.sound.play();
    }

    playErrorSound() {
        const src = './../../assets/audio/operation-error.wav'
        this.sound = new Howl({

            src: [src]
        })
        this.sound.play();
    }
    playNewMessageSound() {
        const src = './../../assets/audio/new-message.wav'
        this.sound = new Howl({

            src: [src]
        })
        this.sound.play();
    }
    playChangeStateSound() {
        const src = './../../assets/audio/change-state.wav'
        this.sound = new Howl({

            src: [src]
        })
        this.sound.play();
    }
}