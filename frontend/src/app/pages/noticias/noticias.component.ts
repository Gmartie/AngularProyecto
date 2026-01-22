/**
 * COMPONENTE: NoticiasComponent
 * 
 * Página de noticias y comunicados del ciclo DAW
 * Muestra contenido agrupado por categorías y fechas
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: Date;
  autor: string;
  categoria: string;
}

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent {
  noticias = signal<Noticia[]>([
    {
      id: 1,
      titulo: 'Nuevas herramientas de desarrollo llegan a 2025',
      contenido: 'El equipo docente ha incorporado nuevas herramientas y frameworks para mantener al alumnado actualizado con las tendencias más recientes en desarrollo web.',
      fecha: new Date('2025-01-02'),
      autor: 'Departamento TI',
      categoria: 'Educación'
    },
    {
      id: 2,
      titulo: 'Becas disponibles para estudiantes destacados',
      contenido: 'Se han abierto convocatorias de becas para estudiantes con expediente académico destacado. Consulta los requisitos y plazos de solicitud en el portal de administración.',
      fecha: new Date('2025-01-01'),
      autor: 'Administración',
      categoria: 'Becas'
    },
    {
      id: 3,
      titulo: 'Jornada de emprendimiento empresarial',
      contenido: 'Próximamente se realizará una jornada sobre iniciativa emprendedora con participación de emprendedores locales. Una oportunidad única para conocer experiencias reales.',
      fecha: new Date('2024-12-28'),
      autor: 'Departamento de Empresa',
      categoria: 'Eventos'
    },
    {
      id: 4,
      titulo: 'Convocatoria FCT (Formación en Centros de Trabajo)',
      contenido: 'Se abre la convocatoria para la FCT. Los alumnos de segundo curso pueden comenzar a enviar solicitudes para empresas de su interés a partir del próximo lunes.',
      fecha: new Date('2024-12-20'),
      autor: 'Coordinación FCT',
      categoria: 'Prácticas'
    },
    {
      id: 5,
      titulo: 'Actualización del sistema de evaluación',
      contenido: 'A partir del segundo trimestre, se implementarán nuevas metodologías de evaluación continua. El equipo docente mantendrá reuniones informativas con el alumnado.',
      fecha: new Date('2024-12-15'),
      autor: 'Jefatura de Estudios',
      categoria: 'Académico'
    },
    {
      id: 6,
      titulo: 'Proyectos fin de ciclo en marcha',
      contenido: 'Los estudiantes de segundo año han comenzado con sus proyectos integradores. Estos proyectos combinan todos los conocimientos adquiridos durante el ciclo.',
      fecha: new Date('2024-12-10'),
      autor: 'Coordinación de Proyectos',
      categoria: 'Educación'
    }
  ]);

  getCategoriaClass(categoria: string): string {
    return categoria.toLowerCase().replaceAll(' ', '-');
  }
}
