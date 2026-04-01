import { Venue } from '../domain/types';

export const VENUES: Venue[] = [
  {
    id: 'vinzavod',
    name: 'Винзавод',
    summary: 'Идеальный вечер в уютном ресторане с европейской кухней',
    rating: '4.7',
    imageKey: 'venueCover1',
    addressLine: 'ТЦ Aurora, ул. Дзрежниского, 42/5',
    address: `677009, Якутск, Промышленный округ
3 этаж`,
    schedule: `Режим работы:
пн-чт                              12:00-24:00
пт-сб                               12:00-01:00
воскресенье                  12:00-24:00`,
    averageCheck: '1600',
    cuisine: 'Европейская',
    tags: ['ресторан', 'европейская', 'центр', 'уютный']
  },
  {
    id: 'surasan',
    name: 'Сурасан',
    summary: 'Настоящая корейская кухня',
    rating: '4.7',
    imageKey: 'venueCover2',
    addressLine: 'пр. Ленина, 15',
    address: `Якутск, квартал делового центра
2 этаж`,
    schedule: `Режим работы:
ежедневно                    12:00-23:00`,
    averageCheck: '1800',
    cuisine: 'Корейская',
    tags: ['ресторан', 'корейская', 'центр', 'яркий']
  },
  {
    id: 'surasan-loft',
    name: 'Сурасан Loft',
    summary: 'Настоящая корейская кухня',
    rating: '4.3',
    imageKey: 'venueCover2',
    addressLine: 'ул. Пояркова, 18',
    address: `Якутск, исторический центр
лофт-пространство`,
    schedule: `Режим работы:
вт-вс                               14:00-00:00`,
    averageCheck: '2200',
    cuisine: 'Корейская fusion',
    tags: ['лофт', 'корейская', 'центр', 'просторно']
  }
];
