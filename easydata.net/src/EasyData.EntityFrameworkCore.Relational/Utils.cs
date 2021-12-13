using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;


namespace EasyData.EntityFrameworkCore
{
    internal static class Utils
    {
        public static string GetEntityNameByType(Type entityType)
        {
            return entityType.Name.Split('`').First();
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
    }
}
