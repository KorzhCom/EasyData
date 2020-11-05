using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData
{
    public class BitOptions 
    {
        private ulong _signature = 0;

        public BitOptions() { }

        internal BitOptions(ulong signature)
        {
            _signature = signature;
        }

        public static explicit operator ulong(BitOptions op) => op._signature;

        public static implicit operator BitOptions(ulong signature) => new BitOptions(signature);

        public static BitOptions operator ~(BitOptions op) => ~op._signature;

        public static BitOptions operator |(BitOptions lhs, BitOptions rhs) => lhs._signature | rhs._signature;

        public static BitOptions operator &(BitOptions lhs, BitOptions rhs) => lhs._signature & rhs._signature;

        public BitOptions With(BitOptions op)
        {
            _signature |= op._signature;
            return this;
        }

        public BitOptions Without(BitOptions op)
        {
            _signature &= ~op._signature;
            return this;
        }

        public bool Contains(BitOptions op)
        {
            return (ulong)(this & op) > 0;
        }
    }
}
