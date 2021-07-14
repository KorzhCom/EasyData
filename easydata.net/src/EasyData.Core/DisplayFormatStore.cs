using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace EasyData
{
    public class DisplayFormatDescriptor
    {

        public DisplayFormatDescriptor(string name, string format)
        {
            Name = name;
            Format = format;
        }

        public string Name { get; }

        public string Format {get; set;}

        public bool IsDefault { get; set; } = false;
    }

    public class DisplayFormatStore : IEnumerable<KeyValuePair<DataType, List<DisplayFormatDescriptor>>>
    {

        private readonly Dictionary<DataType, List<DisplayFormatDescriptor>> _dict = new Dictionary<DataType, List<DisplayFormatDescriptor>>();


        public DisplayFormatStore()
        { 
        
        }

        public DisplayFormatStore(Dictionary<DataType, List<DisplayFormatDescriptor>> dict)
        {
            foreach (var kv in dict) {
                _dict.Add(kv.Key, kv.Value);
            }
        }


        public DisplayFormatDescriptor AddOrUpdate(DataType type, string name, string format, bool isDefault = false)
        {
            DisplayFormatDescriptor desc;
            if (TryGetFormat(type, name, out desc)) {
                desc.Format = format;
                desc.IsDefault = isDefault;
            }
            else {
                desc = new DisplayFormatDescriptor(name, format);
                desc.IsDefault = isDefault;
                if (_dict.TryGetValue(type, out var formats)) {
                    formats.Add(desc);
                }
                else {
                    _dict.Add(type, new List<DisplayFormatDescriptor>() { desc });
                }
            }
               
            return desc;
        }


        public void SetDefault(DataType type, string name)
        {
            if (_dict.TryGetValue(type, out var formats)) {
                foreach (var format in formats) {
                    format.IsDefault = format.Name == name;
                }
            }
        }

        public DisplayFormatDescriptor GetDefault(DataType type)
        {
            if (_dict.TryGetValue(type, out var formats)) {
                return formats.FirstOrDefault(f => f.IsDefault);
            }

            return null;
        }

        public void Delete(DataType type, string name)
        {
            if (_dict.TryGetValue(type, out var formats)) {
                formats.RemoveAll(f => f.Name == name);
            }
        }

        public bool TryGetFormat(DataType type, string name, out DisplayFormatDescriptor desc)
        {
            var formats = _dict.TryGetValue(type, out var fmts) ? fmts : new List<DisplayFormatDescriptor>();
            desc = formats.Find(f => f.Name == name);

            return desc != null;
        }

        public void Clear()
        {
            _dict.Clear();
        }

        public IEnumerator<KeyValuePair<DataType, List<DisplayFormatDescriptor>>> GetEnumerator()
        {
            return _dict.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}

