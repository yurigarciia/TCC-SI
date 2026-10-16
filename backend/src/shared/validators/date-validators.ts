import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Achado numa conversa com o usuário: todo campo de data digitado por humano (evento, data de
// nascimento de dependente) só validava formato (@IsDateString), nunca se o valor fazia sentido
// — dava pra cadastrar um evento em 1998 ou um dependente nascido em 2090. Centraliza aqui os
// dois guards de "data absurda" pra reaproveitar nos DTOs sem duplicar lógica.

// Evento marcado no passado — tolerância de 1h pra não recusar um evento sendo cadastrado minutos
// depois do horário combinado (ex.: diretoria registrando de cabeça o baile que já começou).
const TOLERANCIA_EVENTO_PASSADO_MS = 60 * 60 * 1000;

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPastDate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'A data não pode estar no passado',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const data = new Date(value);
          if (Number.isNaN(data.getTime())) return false;
          return data.getTime() >= Date.now() - TOLERANCIA_EVENTO_PASSADO_MS;
        },
      },
    });
  };
}

// Data de nascimento plausível: não pode ser no futuro, nem implicar idade maior que o teto
// informado (padrão 120 anos — generoso o bastante pra nunca recusar um caso real, mas recusa
// erros de digitação óbvios como trocar o século).
export function IsPlausibleBirthDate(
  idadeMaximaAnos = 120,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPlausibleBirthDate',
      target: object.constructor,
      propertyName,
      constraints: [idadeMaximaAnos],
      options: {
        message: `Data de nascimento inválida — não pode ser no futuro nem implicar idade maior que ${idadeMaximaAnos} anos`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const data = new Date(value);
          if (Number.isNaN(data.getTime())) return false;
          const agora = new Date();
          if (data.getTime() > agora.getTime()) return false;
          const [limiteAnos] = args.constraints as [number];
          const dataMinima = new Date(agora);
          dataMinima.setFullYear(dataMinima.getFullYear() - limiteAnos);
          return data.getTime() >= dataMinima.getTime();
        },
      },
    });
  };
}
