import { Injectable } from '@angular/core';
import { ChecklistItem } from './ticket.service';
import { TicketDepartment } from './ticket.service';

export interface ChecklistTemplateItem {
  label: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  department?: TicketDepartment;
  items: ChecklistTemplateItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistTemplateService {
  private readonly templates: ChecklistTemplate[] = [
    {
      id: 'acesso-sistemas',
      name: 'Acesso a sistema',
      department: 'sistemas',
      items: [
        { label: 'Verificar perfil no AD' },
        { label: 'Conceder permissão no sistema' },
        { label: 'Enviar credenciais ao usuário' }
      ]
    },
    {
      id: 'erro-software',
      name: 'Erro em software',
      department: 'sistemas',
      items: [
        { label: 'Reproduzir o problema' },
        { label: 'Verificar logs do sistema' },
        { label: 'Aplicar correção ou escalar' },
        { label: 'Validar com o usuário' }
      ]
    },
    {
      id: 'hardware',
      name: 'Problema de hardware',
      department: 'infra',
      items: [
        { label: 'Diagnosticar equipamento' },
        { label: 'Registrar patrimônio se necessário' },
        { label: 'Substituir ou enviar para manutenção' },
        { label: 'Testar e entregar' }
      ]
    },
    {
      id: 'rede-internet',
      name: 'Rede / Internet',
      department: 'infra',
      items: [
        { label: 'Verificar conectividade' },
        { label: 'Testar cabo e switch' },
        { label: 'Verificar configuração de rede' },
        { label: 'Documentar solução' }
      ]
    },
    {
      id: 'impressora',
      name: 'Impressora',
      department: 'infra',
      items: [
        { label: 'Verificar papel e toner' },
        { label: 'Reiniciar fila de impressão' },
        { label: 'Testar impressão' }
      ]
    }
  ];

  getTemplatesByDepartment(department: TicketDepartment | ''): ChecklistTemplate[] {
    if (!department) return [];
    return this.templates.filter(t => !t.department || t.department === department);
  }

  getChecklistForTemplate(templateId: string): ChecklistItem[] {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return [];
    return template.items.map((item, index) => ({
      id: `${templateId}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      label: item.label,
      done: false
    }));
  }

  getTemplateById(templateId: string): ChecklistTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }
}
