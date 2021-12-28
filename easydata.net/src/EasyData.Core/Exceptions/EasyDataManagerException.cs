using System;

namespace EasyData
{
    public class EasyDataManagerException : Exception
    {
        public EasyDataManagerException(string message) : base(message)
        { }
    }

    public class RecordNotFoundException : EasyDataManagerException
    {
        public RecordNotFoundException(string sourceId, string recordKey)
            : base($"Can't found the record with ID {recordKey} in {sourceId}")
        { }
    }

    public class ContainerNotFoundException : EasyDataManagerException
    {
        public ContainerNotFoundException(string sourceId) : base($"Container is not found: {sourceId}")
        { }
    }
}
