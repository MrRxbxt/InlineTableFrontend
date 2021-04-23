import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankAccountService } from '../shared/bank-account.service';
import { BankService } from '../shared/bank.service';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css'],
})
export class BankAccountComponent implements OnInit {
  bankAccountForms: FormArray = this.fb.array([]);
  bankList = [];
  notification = null;

  constructor(
    private fb: FormBuilder,
    private bankService: BankService,
    private bankAccountService: BankAccountService
  ) {}

  ngOnInit(): void {
    this.bankService
      .getBankList()
      .subscribe((res) => (this.bankList = res as []));

    this.bankAccountService.getBankAccountList().subscribe((res) => {
      if (res == []) {
        this.addBankAccountForm();
      } else {
        // generate formArray as per data received from BankAccount table
        (res as []).forEach((bankAccount: any) => {
          this.bankAccountForms.push(
            this.fb.group({
              bankAccountID: [bankAccount.bankAccountID],
              accountNumber: [bankAccount.accountNumber, Validators.required],
              accountHolder: [bankAccount.accountHolder, Validators.required],
              bankID: [bankAccount.bankID, Validators.min(1)],
              IFSC: [bankAccount.ifsc, Validators.required],
            })
          );
        });
      }
    });
  }

  addBankAccountForm() {
    this.bankAccountForms.push(
      this.fb.group({
        bankAccountID: [0],
        accountNumber: ['', Validators.required],
        accountHolder: ['', Validators.required],
        bankID: [0, Validators.min(1)],
        IFSC: ['', Validators.required],
      })
    );
  }

  onSubmit(fg: FormGroup) {
    if (fg.value.bankAccountID == 0) {
      this.bankAccountService
        .postBankAccount(fg.value)
        .subscribe((res: any) => {
          fg.patchValue({ bankAccountID: res.bankAccountID });
          this.showNotification('insert');
        });
    } else {
      this.bankAccountService.putBankAccount(fg.value).subscribe((res: any) => {
        this.showNotification('update');
      });
    }
  }

  onDelete(id, i) {
    if (id == 0) {
      this.bankAccountForms.removeAt(i);
    } else if (confirm('Do you want to delete this record?')) {
      this.bankAccountService.deleteBankAccount(id).subscribe((res) => {
        this.bankAccountForms.removeAt(i);
        this.showNotification('delete');
      });
    }
  }

  showNotification(category) {
    switch (category) {
      case 'insert':
        this.notification = { class: 'text-success', message: 'Saved!' };
        break;
      case 'update':
        this.notification = { class: 'text-primary', message: 'Updated!' };
        break;
      case 'delete':
        this.notification = { class: 'text-danger', message: 'Deleted!' };
        break;
      default:
        break;
    }

    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}
