using System;
using System.Threading;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json.Linq;

using Moq;
using Xunit;
using FluentAssertions;

using EasyData.Services;
using Newtonsoft.Json;

namespace EasyData.Core.Tests.Services
{
    public class EasyDataOptionsTests
    {
        private readonly EasyDataOptions _target;

        public EasyDataOptionsTests()
        {
            _target = new EasyDataOptions();
        }

        [Fact]
        public void Endpoint_should_have_default_value()
        {
            _target.Endpoint.Should().Be("/api/easydata");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void RegisterFilter_should_throw_ArgumentException_on_wrong_class(string filterClass)
        {
            _target.Invoking(x => x.RegisterFilter(filterClass, typeof(EasyFilter)))
                .Should().ThrowExactly<ArgumentException>();
        }

        [Fact]
        public void RegisterFilter_should_throw_ArgumentException_on_wrong_type()
        {
            _target.Invoking(x => x.RegisterFilter("test", typeof(object)))
                .Should().ThrowExactly<ArgumentException>();
        }

        [Fact]
        public void RegisterFilter_should_register_filter()
        {
            _target.RegisterFilter("dummyFilter", typeof(DummyFilter));
            var filter = _target.ResolveFilter("dummyFilter", new MetaData());
            filter.Should().NotBeNull().And.BeOfType<DummyFilter>();
        }

        [Fact]
        public void RegisterFilterGeneric_should_register_filter()
        {
            _target.RegisterFilter<DummyFilter>("dummyFilter");
            var filter = _target.ResolveFilter("dummyFilter", new MetaData());
            filter.Should().NotBeNull().And.BeOfType<DummyFilter>();
        }

        [Fact]
        public void ResolveFilter_should_return_null_if_no_filter()
        {
            _target.ResolveFilter("test", new MetaData()).Should().BeNull();
        }

        [Fact]
        public void UseModelTuner_should_set_ModelTuner()
        {
            Action<MetaData> tuner = (_) => { };
            _target.UseModelTuner(tuner);
            _target.ModelTuner.Should().Be(tuner);
        }

        [Fact]
        public void UseManager_should_set_EasyDataManagerResolver()
        {
            EasyDataManagerResolver resolver = (services, options) => Mock.Of<EasyDataManager>();
            _target.UseManager(resolver);
            _target.ManagerResolver.Should().Be(resolver);
        }

        [Fact]
        public void UseManagerGeneric_should_get_manager_from_service_provider()
        {
            _target.UseManager<DummyEasyDataManager>();
            _target.ManagerResolver.Should().NotBeNull();
            _target.ManagerResolver(Mock.Of<IServiceProvider>(), _target).Should().BeOfType<DummyEasyDataManager>();
        }

        private class DummyFilter : EasyFilter
        {
            public DummyFilter(MetaData model) : base(model) { }

            public override object Apply(MetaEntity entity, bool isLookup, object data)
            {
                throw new NotImplementedException();
            }

            public override Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }
        }

        private class DummyEasyDataManager : EasyDataManager
        {
            public DummyEasyDataManager(IServiceProvider services, EasyDataOptions options): base(services, options)
            {

            }

            public override Task<object> CreateEntityAsync(string modelId, string entityContainer, JObject props, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task DeleteEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string entityContainer, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task<EasyDataResultSet> GetEntitiesAsync(string modelId, string entityContainer, IEnumerable<EasyFilter> filters = null, IEnumerable<EasySorter> sorters = null, bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task<object> GetEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task<long> GetTotalEntitiesAsync(string modelId, string entityContainer, IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }

            public override Task<object> UpdateEntityAsync(string modelId, string entityContainer, string keyStr, JObject props, CancellationToken ct = default)
            {
                throw new NotImplementedException();
            }
        }
    }
}
