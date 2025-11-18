# Reunion aggregation API

REST service that aggregates the results of several API responses.

Run using:

    npm start

## API design

### Endpoints

- `/links` om links naar andere projecten op een pagina te kunnen tonen
  (produceert JSON of evt. ook kant-en-klaar HTML-fragment)
- `/search` voor unified search
  (produceert JSON-met-HTML-fragmenten of evt. een kant-en-klaar HTML-fragment)

### Input

Beide endpoints hebben deze vereiste parameters:
- `q`: ingang (bijv. lemma, voor `/links`) of zoekterm(en) (voor `/search`)
- `projects`: Lijst projecten waarnaar we zouden willen linken. `@all` betekent alle projecten (maar dit vergt relatief veel resources). (andere `@` collecties zouden we later kunnen toevoegen)

Voor `/links` zijn deze extra optionele parameters beschikbaar:
- `molex-lemma-id`: het Molex lemma-ID dat gebruikt kan worden om links te vinden
- `filter`: comma-separated lijstje met labels (bijv. label `idiom` bij Woordcombinaties betekent "geef alleen idiomen als respons"). Een `-` voor een label is een uitsluiting (`-idiom` betekent dus "geen idiomen"). Elk project bepaalt zelf op welke labels (if any) gefilterd kan worden. Een project mag de `filter` parameters dus negeren. Voorlopig doen we dat.

### Output

Response van `/links` per resultaat:

- `resource`, bijv. *Woordcombinaties*
- 'title`, titel bij de URL, d.w.z. de entry-ingang of zoekvraag. Bijv. *aanbieden* (te gebruiken in linktekst)
- `url`, bijv. https://woordcombinaties.ivdnt.org/docs/aanbieden/687883/
- `urltype`: `zoek` (zoeklink met resultaten), `zoek?` (zoeklink, mogelijk geen resultaten) of `direct` (directe link naar entry))
- `type`: projectspecifieke classificatie, bijv.: is het een woord, idioom of formule? (verschilt per project)

Voorbeeld:

```jsonc
{
  "results": [
    {
      "resource": "Woordcombinaties",
      "title": "aanbieden",
      "url": "https://woordcombinaties.ivdnt.org/docs/aanbieden/687883/",
      "urltype": "direct",
      "type": "word"
    },

    //...

  ]
}
```

Response van `/search` per resource (bijv. `ONW`):
- `number`: aantal resultaten gevonden in deze resource
- `html`: HTML-code voor deze resource (beperkte tags, standaard CSS-classes zodat het uniform gestyled kan worden)

```jsonc
{
  "resources": [
    {
      "resource": "Woordcombinaties",
      "number": 12,
      "html": "<ul> ... </ul>"
    },

    //...
    
  ]
}
```
