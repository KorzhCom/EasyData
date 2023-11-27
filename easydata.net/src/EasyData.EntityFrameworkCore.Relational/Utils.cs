using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;


namespace EasyData.EntityFrameworkCore
{
    internal static class Utils
    {
        public static string GetEntityName(IEntityType entityType)
        {
            var p = entityType.Name.LastIndexOf('.');
            var entityName = entityType.Name.Substring(p + 1);
            p = entityName.IndexOf('`');
            if (p > 0) entityName = entityName.Substring(0, p);
            p = entityName.IndexOf('<');
            if (p > 0) entityName = entityName.Substring(0, p);
            return entityName;
        }

        public static PropertyInfo GetPropertyInfoBySelector<TEntity>(Expression<Func<TEntity, object>> propertySelector)
            where TEntity : class
        {
            if (propertySelector.Body is MemberExpression expression) {
                return (PropertyInfo)expression.Member;
            }
            else {
                var memberExpression = ((UnaryExpression)propertySelector.Body).Operand as MemberExpression;
                return (PropertyInfo)memberExpression.Member;
            }
        }

        /// <summary>
        /// Gets the schema name for the specified IEntityType
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        /// <returns>System.String.</returns>
        public static string GetDbSchema(this IEntityType entityType)
        {
            var result = entityType.GetSchema();

#if NET
            if (result == null) {
                result = entityType.GetViewSchema();
            }
#endif
            return result;
        }

        /// <summary>
        /// Gets the table name for the specified IEntityType.
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        /// <returns>System.String.</returns>
        public static string GetDbTableName(this IEntityType entityType)
        {
            var result = entityType.GetTableName();

#if NET
            if (result == null) {
                result = entityType.GetViewName();
            }
#endif
            return result;
        }

        /// <summary>
        /// Gets the column name for the specified IProperty.
        /// </summary>
        /// <param name="property">The property.</param>
        /// <returns>System.String.</returns>
        public static string GetDbColumnName(this IProperty property)
        {
#if NET
            var entityType = property.DeclaringType as IEntityType;
            if (entityType == null) return null;
            var tableName = entityType.GetDbTableName();
            if (tableName == null) return null;
            var schema = entityType.GetDbSchema();
            var storeObjectIdentifier = StoreObjectIdentifier.Table(tableName, schema);
            var result = property.GetColumnName(storeObjectIdentifier);
            if (string.IsNullOrEmpty(result)) {
                storeObjectIdentifier = StoreObjectIdentifier.View(tableName, schema);
                result = property.GetColumnName(storeObjectIdentifier);
            }

            return result;
#else
            return property.GetColumnName();
#endif
        }
    }
}
