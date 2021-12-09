using System;
using System.Linq.Expressions;

namespace EasyData.EntityFrameworkCore
{
    public interface IMetaEntityCustomizer<TEntity> where TEntity : class
    {
        IMetaEntityCustomizer<TEntity> SetDescription(string description);
        IMetaEntityCustomizer<TEntity> SetDisplayName(string displayName);
        IMetaEntityCustomizer<TEntity> SetDisplayNamePlural(string displayNamePlural);
        IMetaEntityCustomizer<TEntity> SetEditable(bool editable);
        IMetaEntityAttrCustomizer Attribute(Expression<Func<TEntity, object>> propertySelector);
    }
}