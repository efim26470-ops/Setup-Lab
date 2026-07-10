# Как обновлять цены

Цена компонента хранится в `priceEUR` и всегда задаётся в евро.

Рекомендуемые поля:

```json
{
  "priceEUR": 376,
  "priceBasis": "market",
  "priceChecked": "2026-07-10",
  "priceReferenceUrl": "https://example.com/product",
  "purchase": {
    "market": "https://market.yandex.ru/search?text=...",
    "ozon": "https://www.ozon.ru/search/?text=...",
    "dns": "https://www.dns-shop.ru/search/?q=...",
    "official": "https://manufacturer.example/product"
  }
}
```

Допустимые значения `priceBasis`:

- `market` — цена проверена по рыночному или официальному источнику;
- `estimate` — ориентировочная цена;
- `local` — пользователь изменил цену на своём устройстве.

Для массового обновления каталога измените `catalog.json`. Для единичной правки откройте карточку компонента и нажмите «Изменить цену и данные» — переопределение сохранится в `localStorage` и не затронет репозиторий.
