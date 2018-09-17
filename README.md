## MongoWB™

- Object that has a MongoWB™ operations as a property
- The parameters of the operation are in the value.

$concat

- Argument: array
- Arrays, MongoWB™, or elements
- Returns an array

$foreach

- Argument: object
  - object.$collection: Array, MongoWB™, FormulaValues™
  - object.$template: MongoWB™, FormulaValues™

----

Example:

```

{
	"_id": "A",
  "name": "Recojo de almacén",
  "input": [
    {
      "name": "fecha",
      "type": "datetime",
      "required": true
    },
    {
      "name": "posts",
      "type": "post",
      "multiplicity": "1..*"
    }
  ],
  "context_processing": [ // name to be defined
    {
      "type": "sushi",
      "sources": {
        "collection": "={{posts}}",
	      "recipe": [
	      	// ...
	      ]
      },
      "destination": "pedidos",
    }
  ],
  "template": {
    "text": "Recoger material de almacén",
    "todos": {
    	"$concat": [
    		{
    			"$foreach": {
    				"$collection": "={{pedidos}}",
    				"$template": {
    					"text": "Recoger {{$item.cantidad}} {{$item.producto}}"
    				}
    			}
    		},
    		{
    			"text": "Firmar pedidos"
    		}
    	]
    }
  }
}
```

### Test

```npm test```