using System;
using System.Linq.Expressions;

namespace EasyData
{
    public interface IMetaEntityBuilder<TEntity> where TEntity : class
    {
        IMetaEntityBuilder<TEntity> SetDescription(string description);
        IMetaEntityBuilder<TEntity> SetDisplayName(string displayName);
        IMetaEntityBuilder<TEntity> SetDisplayNamePlural(string displayNamePlural);
        IMetaEntityBuilder<TEntity> SetEditable(bool editable);
        IMetaEntityBuilder<TEntity> SetEnabled(bool enabled);
        IMetaEntityAttrBuilder Attribute(Expression<Func<TEntity, object>> propertySelector);
    }
}