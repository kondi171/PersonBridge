import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../app.environment';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss']
})
export class PINComponent {
  @Input() correctPIN = 1;
  @Input() yourID = '';
  @Output() accessGranted = new EventEmitter<boolean>();
  PIN = ['', '', '', ''];
  isPINForgotten = false;
  password = '';

  constructor(private toastr: ToastrService) { }

  validateInput(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    if (!/^[0-9]$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  moveFocus(currentInput: HTMLInputElement, nextInput: HTMLInputElement | null): void {
    if (currentInput.value.length >= currentInput.maxLength) {
      if (nextInput) {
        nextInput.focus();
      } else {

        this.handleAccessMessagesByPIN();
      }
    }
  }

  handleAccessMessagesByPIN() {
    const pinCode = this.PIN.join('');
    if (Number(pinCode) === this.correctPIN) {
      this.accessGranted.emit(true);
      this.toastr.success('Correct PIN!', 'Access Granted');
    } else this.toastr.error('Incorrect PIN!', 'Access Denied');
  }
  handleAccessMessagesByPassword() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Access Denied');
      return;
    }
    fetch(`${environment.apiURL}/chat/PIN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, password: this.password })
    })
      .then(response => {
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          this.accessGranted.emit(true);
          this.toastr.success('Correct password!', 'Access Granted');
        } else this.toastr.error('Invalid password!', 'Access Denied');
      })
      .catch(error => {
        this.toastr.error('An Error Occured while granting Access!', 'Access Error');
        console.error("Access Denied:", error);
      });

  }
  handleChangeAccessMethod() {
    this.isPINForgotten = !this.isPINForgotten;
    this.PIN = ['', '', '', ''];
  }
}
