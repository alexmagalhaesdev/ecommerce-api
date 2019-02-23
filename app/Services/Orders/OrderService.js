'use stric'

class OrderService {
    constructor(modelInstance, trx) {
        this.model = modelInstance
        this.trx = trx
    }

    async syncItems(items) {
        await this.model.items().delete(this.trx)
        return await this.model.items().createMany(items, this.trx)
    }

    async updateItems(items) {
        let currentItems = await this.model
            .items()
            .whereIn('id', items.map(item => item.id))
            .fetch()
        // Deleta os itens que não estão em `items`
        await this.model
            .items()
            .whereNotIn('id', items.map(item => item.id))
            .delete(this.trx)

        // Atualiza os valores e quantidades dos itens armazenados em `items`
        await Promise.all(
            currentItems.rows.map(async item => {
                item.fill(items.filter(n => n.id === item.id)[0])
                await item.save(this.trx)
            })
        )
    }
}

module.exports = OrderService
