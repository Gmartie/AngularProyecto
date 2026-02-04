/**
 * COMPONENTE: WindowWrapperComponent
 * 
 * Componente wrapper que envuelve cualquier contenido en una ventana estilo Windows 95
 * Incluye barra de título con botones de minimizar, maximizar y cerrar
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-window-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="window-wrapper" 
         [class.maximized]="isMaximized"
         [style.z-index]="zIndex">
      
      <!-- Barra de título -->
      <div class="window-titlebar" (mousedown)="onTitlebarMouseDown($event)">
        <div class="window-title">
          <img [src]="icon" [alt]="title" class="window-icon">
          {{ title }}
        </div>
        <div class="window-buttons">
          <button class="window-btn minimize-btn" 
                  (click)="onMinimize()"
                  title="Minimizar">
            <span>_</span>
          </button>
          <button class="window-btn maximize-btn" 
                  (click)="onMaximize()"
                  title="Maximizar / Restaurar">
            <span>{{ isMaximized ? '❐' : '□' }}</span>
          </button>
          <button class="window-btn close-btn" 
                  (click)="onClose()"
                  title="Cerrar">
            <span>✕</span>
          </button>
        </div>
      </div>

      <!-- Contenido de la ventana -->
      <div class="window-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .window-wrapper {
      position: fixed;
      background: #c0c0c0;
      border: 2px outset #ffffff;
      box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      
      /* Tamaño por defecto */
      width: 80%;
      height: 80%;
      top: 10%;
      left: 10%;
      
      transition: all 0.2s ease;
    }

    .window-wrapper.maximized {
      width: 100% !important;
      height: calc(100% - 50px) !important; /* Restar altura de taskbar */
      top: 50px !important;
      left: 0 !important;
    }

    .window-titlebar {
      background: linear-gradient(to right, #000080, #1084d0);
      color: #ffffff;
      padding: 0.3rem 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 0.9rem;
      cursor: move;
      user-select: none;
    }

    .window-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .window-icon {
      width: 16px;
      height: 16px;
    }

    .window-buttons {
      display: flex;
      gap: 0.2rem;
    }

    .window-btn {
      width: 20px;
      height: 20px;
      background: #c0c0c0;
      border: 1px outset #ffffff;
      cursor: pointer;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: bold;
      padding: 0;
    }

    .window-btn:hover {
      background: #d4d0c8;
    }

    .window-btn:active {
      border-style: inset;
    }

    .close-btn:hover {
      background: #ff0000;
      color: #ffffff;
    }

    .window-content {
      flex: 1;
      background: #c0c0c0;
      overflow: auto;
      padding: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .window-wrapper {
        width: 95% !important;
        height: 90% !important;
        top: 5% !important;
        left: 2.5% !important;
      }
    }
  `]
})
export class WindowWrapperComponent implements OnInit {
  @Input() windowId!: string;
  @Input() title: string = 'Ventana';
  @Input() icon: string = '/Icons/computer_icon.png';

  isMaximized = false;
  zIndex = 100;

  constructor(private windowService: WindowService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en las ventanas
    this.windowService.windows$.subscribe(windows => {
      const window = windows.find(w => w.id === this.windowId);
      if (window) {
        this.isMaximized = window.isMaximized;
        this.zIndex = window.zIndex;
      }
    });
  }

  onMinimize(): void {
    this.windowService.minimizeWindow(this.windowId);
  }

  onMaximize(): void {
    this.windowService.toggleMaximize(this.windowId);
  }

  onClose(): void {
    this.windowService.closeWindow(this.windowId);
  }

  onTitlebarMouseDown(event: MouseEvent): void {
    // Traer ventana al frente al hacer clic en la barra de título
    this.windowService.focusWindow(this.windowId);
  }
}
