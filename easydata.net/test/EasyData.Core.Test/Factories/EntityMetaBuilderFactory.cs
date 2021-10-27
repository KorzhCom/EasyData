using System;
using System.Collections.Generic;
using System.Text;
using EasyData.Services;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Test <see cref="EntityMetaBuilder<typeparamref name="T"/>"/> factory.
    /// </summary>
    class EntityMetaBuilderFactory<T>: IFactory<EntityMetaBuilder<T>>
    {
        /// <inheritdoc />
        public EntityMetaBuilder<T> Create()
        {
            var entityMetaBuilder = new EntityMetaBuilder<T>();
            entityMetaBuilder.SetDescription(Faker.Lorem.Sentence());
            entityMetaBuilder.SetDisplayName(Faker.Lorem.Sentence());
            entityMetaBuilder.SetDisplayNamePlural(Faker.Lorem.Sentence());
            entityMetaBuilder.SetEnabled(Faker.Boolean.Random());

            return entityMetaBuilder;
        }
    }
}
