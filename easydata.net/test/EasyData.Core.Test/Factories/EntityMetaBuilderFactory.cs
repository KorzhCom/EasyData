using System;
using System.Collections.Generic;
using System.Text;
using EasyData.Services;

namespace EasyData.Core.Test.Factories
{
    class EntityMetaBuilderFactory<T>: IFactory<EntityMetaBuilder<T>>
    {
        public EntityMetaBuilder<T> Object { get; }

        public EntityMetaBuilderFactory()
        {
            var entityMetaBuilder = new EntityMetaBuilder<T>();
            entityMetaBuilder.SetDescription(Faker.Lorem.Sentence());
            entityMetaBuilder.SetDisplayName(Faker.Lorem.Sentence());
            entityMetaBuilder.SetDisplayNamePlural(Faker.Lorem.Sentence());
            entityMetaBuilder.SetEnabled(Faker.Boolean.Random());

            Object = entityMetaBuilder;
        }
    }
}
