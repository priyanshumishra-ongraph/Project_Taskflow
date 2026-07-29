import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
