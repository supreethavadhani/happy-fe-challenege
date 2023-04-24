import { Validators } from "@angular/forms";

export const loginModel = {
    username: ['', Validators.email],
    password: ['', [Validators.required, Validators.minLength(8)]]
  }